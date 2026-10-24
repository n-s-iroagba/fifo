import { Request, Response } from 'express';
import { Employer, JoblistingEmployer, JobListing } from '../models';
import { CONSTANTS } from '../constants';
import { logger } from '../utils/logger';

export class EmployerController {
    /**
     * Get all employers
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const employers = await Employer.findAll({
                order: [['isEmploying', 'DESC'], ['name', 'ASC']],
            });
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employers });
        } catch (error: any) {
            logger.error('[EmployerController.getAll]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch employers' });
        }
    }

    /**
     * Get employer by ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const employer = await Employer.findByPk(Number(id), {
                include: [
                    {
                        model: JoblistingEmployer,
                        as: 'JoblistingEmployers',
                        include: [{ model: JobListing, as: 'JobListing' }]
                    }
                ]
            });
            if (!employer) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Employer not found' });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employer });
        } catch (error: any) {
            logger.error('[EmployerController.getById]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch employer' });
        }
    }

    /**
     * Get currently employing host employer (only one true in system)
     */
    async getCurrentlyEmploying(req: Request, res: Response): Promise<void> {
        try {
            let employer = await Employer.findOne({ where: { isEmploying: true } });
            if (!employer) {
                // Fallback to first employer if none marked
                employer = await Employer.findOne();
            }
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employer });
        } catch (error: any) {
            logger.error('[EmployerController.getCurrentlyEmploying]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch currently employing employer' });
        }
    }

    /**
     * Create employer (enforce only 1 isEmploying === true)
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, websiteUrl, companyDescription, isEmploying, location, logoUrl } = req.body;
            if (!name || !websiteUrl || !companyDescription) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Name, websiteUrl, and companyDescription are required' });
                return;
            }

            const shouldBeEmploying = Boolean(isEmploying);
            if (shouldBeEmploying) {
                // Set all other employers to isEmploying = false
                await Employer.update({ isEmploying: false }, { where: {} });
            }

            const employer = await Employer.create({
                name,
                websiteUrl,
                companyDescription,
                isEmploying: shouldBeEmploying,
                location: location || null,
                logoUrl: logoUrl || null
            });

            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: employer });
        } catch (error: any) {
            logger.error('[EmployerController.create]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to create employer' });
        }
    }

    /**
     * Update employer (enforce only 1 isEmploying === true)
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, websiteUrl, companyDescription, isEmploying, location, logoUrl } = req.body;

            const employer = await Employer.findByPk(Number(id));
            if (!employer) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Employer not found' });
                return;
            }

            if (isEmploying === true || isEmploying === 'true') {
                // Clear any other employer's isEmploying flag
                await Employer.update({ isEmploying: false }, { where: {} });
                employer.isEmploying = true;
            } else if (isEmploying === false || isEmploying === 'false') {
                employer.isEmploying = false;
            }

            if (name !== undefined) employer.name = name;
            if (websiteUrl !== undefined) employer.websiteUrl = websiteUrl;
            if (companyDescription !== undefined) employer.companyDescription = companyDescription;
            if (location !== undefined) employer.location = location;
            if (logoUrl !== undefined) employer.logoUrl = logoUrl;

            await employer.save();
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employer });
        } catch (error: any) {
            logger.error('[EmployerController.update]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to update employer' });
        }
    }

    /**
     * Delete employer
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const employer = await Employer.findByPk(Number(id));
            if (!employer) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Employer not found' });
                return;
            }
            await JoblistingEmployer.destroy({ where: { employerId: id } });
            await employer.destroy();
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Employer deleted successfully' });
        } catch (error: any) {
            logger.error('[EmployerController.delete]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to delete employer' });
        }
    }

    /**
     * Get all JoblistingEmployer records with vacancy URLs
     */
    async getAllJoblistingEmployers(req: Request, res: Response): Promise<void> {
        try {
            const items = await JoblistingEmployer.findAll({
                include: [
                    { model: Employer, as: 'Employer', attributes: ['id', 'name', 'websiteUrl', 'isEmploying'] },
                    { model: JobListing, as: 'JobListing', attributes: ['id', 'title', 'company', 'location'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: items });
        } catch (error: any) {
            logger.error('[EmployerController.getAllJoblistingEmployers]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch vacancy URLs' });
        }
    }

    /**
     * Update vacancyUrl for a JoblistingEmployer item
     */
    async updateVacancyUrl(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { vacancyUrl } = req.body;

            const item = await JoblistingEmployer.findByPk(Number(id));
            if (!item) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Joblisting employer record not found' });
                return;
            }

            item.vacancyUrl = vacancyUrl !== undefined ? (vacancyUrl?.trim() || null) : null;
            await item.save();

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Vacancy URL updated successfully',
                data: item
            });
        } catch (error: any) {
            logger.error('[EmployerController.updateVacancyUrl]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to update vacancy URL' });
        }
    }
}

export const employerController = new EmployerController();
